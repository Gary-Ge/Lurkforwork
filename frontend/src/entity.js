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

export class LikeDTO {
    constructor(id, turnon) {
        this.id = id
        this.turnon = turnon
    }
}