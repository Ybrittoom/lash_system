// A tela usa as mesmas APIs que o Insomnia, enviando o JWT da sessao atual.
// TODO: conferir no navegador os campos, o filtro de estado e os formulários da página.
const tokenStorageKey = "lashSystema.accessToken";
const productsEndpoint = "/api/v1/products";

const tableBody = document.querySelector("#products-table-body");
const productForm = document.querySelector("#product-form");
const entryForm = document.querySelector("#entry-form");
const productSelect = document.querySelector("#entry-product");
const searchInput = document.querySelector("#product-search");
const statusFilter = document.querySelector("#product-status-filter");
const productFeedback = document.querySelector("#product-feedback");
const entryFeedback = document.querySelector("#entry-feedback");
const productsListCount = document.querySelector("#products-list-count");
const productSubmit = document.querySelector("#product-submit");
const entrySubmit = document.querySelector("#entry-submit");
const unitSelect = document.querySelector("#product-unit");
const minimumInput = document.querySelector("#minimum-quantity");
const entryQuantityInput = document.querySelector("#entry-quantity");
const token = sessionStorage.getItem(tokenStorageKey);

let products = [];

if (!token) {
  window.location.replace("/login");
} else {
  loadProducts();
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    sessionStorage.removeItem(tokenStorageKey);
    window.location.replace("/login");
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  if (!response.ok) {
    throw new Error(data.error || "Não foi possível concluir a solicitação.");
  }

  return data;
}

function showFeedback(element, message, isError = false) {
  element.textContent = message;
  element.dataset.state = isError ? "error" : "success";
  element.hidden = false;
}

function formatAmount(value) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 })
    .format(Number(value) || 0);
}

function makeCell(text, className) {
  const cell = document.createElement("td");
  if (className) cell.className = className;
  cell.textContent = text;
  return cell;
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const visibleProducts = products.filter((product) =>
    `${product.name} ${product.category || ""}`.toLocaleLowerCase("pt-BR").includes(query) &&
    (statusFilter.value === "all" ||
      (statusFilter.value === "active" && product.is_active) ||
      (statusFilter.value === "inactive" && !product.is_active))
  );

  tableBody.replaceChildren();
  productsListCount.textContent = `Exibindo ${visibleProducts.length} de ${products.length} produtos`;

  if (visibleProducts.length === 0) {
    const row = document.createElement("tr");
    const cell = makeCell(products.length ? "Nenhum produto corresponde aos filtros." : "Você ainda não cadastrou produtos.");
    cell.colSpan = 5;
    row.append(cell);
    tableBody.append(row);
  }

  for (const product of visibleProducts) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const nameWrap = document.createElement("div");
    nameWrap.className = "product-name-cell";
    const symbol = document.createElement("span");
    symbol.className = "product-symbol symbol-leopard";
    symbol.setAttribute("aria-hidden", "true");
    symbol.textContent = "✦";
    const textWrap = document.createElement("span");
    const name = document.createElement("strong");
    name.textContent = product.name;
    textWrap.append(name);
    nameWrap.append(symbol, textWrap);
    nameCell.append(nameWrap);

    const quantity = Number(product.quantity);
    const quantityCell = document.createElement("td");
    const quantityLabel = document.createElement("strong");
    quantityLabel.className = "quantity-value";
    quantityLabel.textContent = formatAmount(quantity);
    quantityCell.append(quantityLabel);
    const statusCell = document.createElement("td");
    const status = document.createElement("span");
    status.className = `stock-status ${product.is_active ? "status-ok" : "status-inactive"}`;
    const dot = document.createElement("i");
    status.append(dot, document.createTextNode(product.is_active ? " Ativo" : " Inativo"));
    statusCell.append(status);

    row.append(
      nameCell,
      makeCell(product.category || "—"),
      makeCell(product.unit, "unit-label"),
      quantityCell,
      statusCell
    );
    tableBody.append(row);
  }

  // O ID fica ligado ao option, enquanto a pessoa escolhe pelo nome do produto.
  const selectedId = productSelect.value;
  productSelect.replaceChildren(new Option("Escolha um produto", ""));
  for (const product of products.filter((item) => item.is_active)) {
    productSelect.add(new Option(`${product.name} — ${formatAmount(product.quantity)} ${product.unit}`, product.id));
  }
  if (products.some((product) => String(product.id) === selectedId)) {
    productSelect.value = selectedId;
  }
}

async function loadProducts() {
  try {
    const data = await requestJson(productsEndpoint, { method: "GET" });
    products = Array.isArray(data.products) ? data.products : [];
    renderProducts();
  } catch (error) {
    productsListCount.textContent = "Não foi possível carregar os produtos.";
    showFeedback(productFeedback, error.message, true);
  }
}

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  productFeedback.hidden = true;
  productSubmit.disabled = true;

  const formData = new FormData(productForm);
  const minimum = Number(formData.get("minimum_quantity"));
  const body = {
    name: String(formData.get("name")).trim(),
    category: String(formData.get("category")).trim() || null,
    unit: formData.get("unit"),
    minimum_quantity: minimum,
    is_active: true,
  };

  try {
    await requestJson(productsEndpoint, { method: "POST", body: JSON.stringify(body) });
    productForm.reset();
    document.querySelector("#minimum-quantity").value = "0";
    updateQuantityStep(unitSelect.value, minimumInput);
    showFeedback(productFeedback, "Produto cadastrado com estoque zero.");
    await loadProducts();
  } catch (error) {
    showFeedback(productFeedback, error.message, true);
  } finally {
    productSubmit.disabled = false;
  }
});

entryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  entryFeedback.hidden = true;
  entrySubmit.disabled = true;

  const productId = productSelect.value;
  const quantity = Number(document.querySelector("#entry-quantity").value);
  const notes = document.querySelector("#entry-notes").value.trim();

  try {
    await requestJson(`${productsEndpoint}/${encodeURIComponent(productId)}/movements`, {
      method: "POST",
      body: JSON.stringify({ quantity, notes: notes || null }),
    });
    entryForm.reset();
    showFeedback(entryFeedback, "Entrada registrada e saldo atualizado.");
    await loadProducts();
  } catch (error) {
    showFeedback(entryFeedback, error.message, true);
  } finally {
    entrySubmit.disabled = false;
  }
});

searchInput.addEventListener("input", renderProducts);
statusFilter.addEventListener("change", renderProducts);
document.querySelector("#show-product-form").addEventListener("click", () => {
  document.querySelector("#new-product").scrollIntoView({ behavior: "smooth", block: "center" });
  document.querySelector("#product-name").focus({ preventScroll: true });
});

function updateQuantityStep(unit, input) {
  const allowsFractions = ["ml", "g"].includes(unit);
  input.step = allowsFractions ? "0.001" : "1";
  input.min = allowsFractions ? "0.001" : "1";
}

unitSelect.addEventListener("change", () => updateQuantityStep(unitSelect.value, minimumInput));
productSelect.addEventListener("change", () => {
  const selectedProduct = products.find((product) => String(product.id) === productSelect.value);
  if (selectedProduct) updateQuantityStep(selectedProduct.unit, entryQuantityInput);
});
