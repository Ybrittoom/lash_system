export async function getProfile(request, response, next) {
    try {
        const userId = request.userId

        return response.json({ userId });
    } catch (error) {
        return next(error);
    }
}