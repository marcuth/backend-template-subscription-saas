export const regexHelper = {
    username: /^[a-z0-9_-]{4,16}$/,
    password: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,64}$/,
}
