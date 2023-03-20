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

export class WatchDTO {
    constructor(email, turnon) {
        this.email = email
        this.turnon = turnon
    }
}

export class UpdateDTO {
    constructor(email, password, name, image) {
            this.email=email
            this.password=password
            this.name=name
            this.image=image
    }
}