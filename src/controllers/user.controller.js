export async function findUserById(request, response, next) {
    try {
        const userId = request.user.id//

        return response.json({ userId });
    } catch (error) {
        return next(error);
    }
}