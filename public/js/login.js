const loginEndpoint = "/api/v1/auth/login";
const profileEndpoint = "/api/v1/me";
const tokenStorageKey = "lashSystema.accessToken";

const form = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#senha");
const passwordToggle = document.querySelector("#password-toggle");
const feedback = document.querySelector("#login-feedback");
const submitButton = document.querySelector("#submit-button");
const submitLabel = document.querySelector("#submit-label");
const loginContent = document.querySelector("#login-content");
const successPanel = document.querySelector("#success-panel");
const successTitle = document.querySelector("#success-title");
const switchAccountButton = document.querySelector("#switch-account");

function showFeedback(message) {
  feedback.textContent = message;
  feedback.hidden = false;
}

function hideFeedback() {
  feedback.textContent = "";
  feedback.hidden = true;
}

function showAuthenticatedState(user) {
  successTitle.textContent = `Olá, ${user.name || "profissional"}!`;
  loginContent.hidden = true;
  successPanel.hidden = false;
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Não foi possível concluir sua solicitação.");
  }

  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideFeedback();
  submitButton.disabled = true;
  submitLabel.textContent = "Verificando seus dados...";

  try {
    const response = await fetch(loginEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: emailInput.value.trim(),
        senha: passwordInput.value,
      }),
    });

    const data = await readResponse(response);

    // O token é guardado apenas nesta aba do navegador. Ele não é exibido
    // na tela e será enviado como Bearer token nas próximas requisições.
    sessionStorage.setItem(tokenStorageKey, data.token);
    showAuthenticatedState(data.user);
  } catch (error) {
    if (error instanceof TypeError) {
      showFeedback("Não consegui conectar à API. Confira se o servidor está rodando e tente novamente.");
    } else {
      showFeedback(error.message);
    }
  } finally {
    submitButton.disabled = false;
    submitLabel.textContent = "Entrar na minha conta";
  }
});

passwordToggle.addEventListener("click", () => {
  const isPasswordHidden = passwordInput.type === "password";
  passwordInput.type = isPasswordHidden ? "text" : "password";
  passwordToggle.textContent = isPasswordHidden ? "Ocultar" : "Mostrar";
  passwordToggle.setAttribute("aria-label", isPasswordHidden ? "Ocultar senha" : "Mostrar senha");
  passwordToggle.setAttribute("aria-pressed", String(isPasswordHidden));
});

switchAccountButton.addEventListener("click", () => {
  // A API não tem endpoint de logout ainda. Aqui limpamos o token guardado
  // nesta aba e voltamos ao formulário para permitir outra entrada.
  sessionStorage.removeItem(tokenStorageKey);
  passwordInput.value = "";
  successPanel.hidden = true;
  loginContent.hidden = false;
  emailInput.focus();
});

async function restoreSession() {
  const token = sessionStorage.getItem(tokenStorageKey);

  if (!token) {
    return;
  }

  try {
    const response = await fetch(profileEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    // Um 401 significa que o token não é mais aceito (por exemplo, expirou).
    // Outros erros podem ser temporários, então mantemos a sessão para tentar
    // novamente sem obrigar a pessoa a fazer login outra vez.
    if (response.status === 401) {
      sessionStorage.removeItem(tokenStorageKey);
      return;
    }

    const data = await readResponse(response);
    showAuthenticatedState(data.user);
  } catch (error) {
    showFeedback(error instanceof TypeError
      ? "Não foi possível validar a sessão. Confira se o servidor está rodando."
      : error.message);
  }
}

restoreSession();
