import { MapperFactory, MapField } from '../src/index';

export class User extends MapperFactory() {

    id: string;
    name: string;
    surname: string;
    username: string;

    test: User;
    /*
        @MapField({
            src: 'obj.obj[0][1].ciao',
            transformer: (arr) => arr.map(role => role + " TEST"),
            reverser: (arr) => arr.map(role => role.replace(" TEST", "")),
        })
        roles?: string[];
    
        @MapField({
            src: 'obj.obj[0][0]',
            transformer: (arr) => arr.map(role => role + " TEST"),
        })
        rolesCopy?: string[];
    */
}

