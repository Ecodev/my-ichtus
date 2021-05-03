import {User, UserByToken} from '../../shared/generated-types';

export interface UserResolve {
    model: User['user'];
}

export interface UserByTokenResolve {
    model: UserByToken['userByToken'];
}
