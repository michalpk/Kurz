var jwt = require('jsonwebtoken')

const verifyToken = (request, response, next) => {
    const token = request.headers['x-access-token']

    if (!token)
        return response.status(401).send('Je potřeba posílat token k autentizaci')

    try {
        const dekodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        request.tokenUser = dekodedToken
    } catch (error) {
        console.log(error)
        return response.status(401).send('Token není validní')
    }

    return next()
}

module.exports = verifyToken