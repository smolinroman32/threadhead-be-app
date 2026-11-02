export interface UserProps {
    name: string;
    email: string;
    passwordHash: string;
    tokenVersion: number;
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

    get passwordHash() {
        return this.props.passwordHash;
    }

    get tokenVersion() {
        return this.props.tokenVersion;
    }

    get createdAt() {
        return this.props.createdAt;
    }

    get updatedAt() {
        return this.props.updatedAt;
    }
}
