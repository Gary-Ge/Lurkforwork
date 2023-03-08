export class LoginDTO {
    constructor(email, password) {
        this.email = email
        this.password = password
    }
}

export class RegisterDTO {
    constructor(email, name, password) {
        this.email = email
        this.name = name
        this.password = password
    }
}