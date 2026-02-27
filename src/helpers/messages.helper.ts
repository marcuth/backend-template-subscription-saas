type Message = string | ((...args: any[]) => string)

type ObjectNotFoundOptions = {
    name: string
    value: string | number
    property?: string
}

type DuplicateObjectOptions = {
    name: string
    value: string | number
    property?: string
}

export const messagesHelper = {
    OBJECT_NOT_FOUND: ({ name, value, property = "id" }: ObjectNotFoundOptions) =>
        `O objeto '${name}' com ${property} '${value}' não foi encontrado no banco de dados!`,
    OBJECT_ALREADY_EXISTS: ({ name, value, property = "id" }: DuplicateObjectOptions) =>
        `Já existe um objeto '${name}' com ${property} '${value}' no banco de dados!`,
    UNAUTHORIZED_USER: "Usuário não autorizado!",
    REQUEST_WITHOUT_AUTHORIZATION_TOKEN:
        "A solicitação não enviou nenhum token de autorização! Forneça um token para acessar rotas protegidas!",
    INVALID_AUTHORIZATION_TOKEN:
        "Este token de autorização é inválido por algum motivo! Tente renová-lo ou tente novamente!",
    INVALID_CREDENTIALS: "Email ou senha inválidos!",
    RESOURCE_ID_NOT_PROVIDED: "O Id do recurso não foi fornecido na solicitação.",
    RESOURCE_NOT_FOUND: "O recurso solicitado não foi encontrado.",
    RESOURCE_ACCESS_UNAUTHORIZED: "Você não está autorizado a acessar este recurso.",
    CANNOT_DELETE_SELF: "Você não pode excluir a si mesmo!",
    INVALID_API_KEY: "Chave de API inválida!",
    STRIPE_CONSUMER_EMAIL_NOT_REGISTERED: "O consumidor não cadastrou o email!",
    STRIPE_CUSTOMER_DELETED: "O consumidor foi excluido!",
    STRIPE_NO_CURRENT_SUBSCRIPTION_PERIOD_DATA: "Nenhuma data de assinatura atual foi encontrada!",
    STRIPE_PRICE_ID_NOT_FOUND_IN_SUBSCRIPTION: "O id do plano não foi encontrado na assinatura!",
    STRIPE_ITEM_ID_NOT_FOUND_IN_SUBSCRIPTION: "O id do item não foi encontrado na assinatura!",
    OAUTH_ACCOUNT_WITHOUT_EMAIL: "A conta não possui um email, ela foi registrada com OAuth!",
    OAUTH_ACCOUNT_WITHOUT_PASSWORD: "A conta não possui uma senha, ela foi registrada com OAuth!",
    INVALID_SUPABASE_AUTH_TOKEN: "Token de autenticação Supabase inválido!",
    UNEXPECTED_ERROR: "Um erro inesperado aconteceu, tente novamente mais tarde!",
    OAUTH_ACCOUNT_ALREADY_EXISTS: "A conta com o email fornecido já existe!",
} satisfies Record<string, Message>
