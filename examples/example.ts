import { MapField, MapperFactory } from "../dist/index";
import { ClassType } from "../dist/index";
import { MapperFactoryFun } from "../dist/mapper";

interface Example {
    ciao?: string;
}

export class User extends MapperFactory {

    id: string;
    username: string;

    @MapField({
        src: 'firstName'
    })
    name: string;

    @MapField({
        src: 'lastName'
    })
    surname: string;

    @MapField({
        src: 'obj.obj[0][1]',
        transformer: (arr) => arr.map(role => role + " TEST TRASFORMER"),
        reverser: (arr) => arr.map(role => role.replace(" TEST TRASFORMER", "")),
    })
    roles?: string[];

    @MapField({
        transformer: (arr) => arr.map(user => new User(user))
    })
    employees?: User[];
}

let emp1: User = new User({ firstName: "Summer", lastName: "Smith" });
let emp2: User = new User({ firstName: "Morty", lastName: "Smith" });

let u = new User({ firstName: "Rick", lastName: "Sanchez", employees: [emp1, emp2] });

console.log(u);
console.log(u.objToModel({ name: "Rick TEST-objToModel", roles: ["CEO", "EMPLOYEE"] }));
console.log(u.toMap());
console.log(u.empty());

//TEST GET AND SET

u.set("name", "Rick TEST-SET");
console.log(u.get("name"));
