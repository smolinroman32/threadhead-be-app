export interface UserProps {
    name: string;
    age: number;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export class UserEntity {
    constructor(
        public readonly id: string,
        private readonly props: UserProps,
    ) {}

    get name() {
        return this.props.name;
    }

    get email() {
        return this.props.email;
    }

    get age() {
        return this.props.age;
    }

    get passwordHash() {
        return this.props.passwordHash;
    }

    get createdAt() {
        return this.props.createdAt;
    }

    get updatedAt() {
        return this.props.updatedAt;
    }
}
