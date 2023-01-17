import { MapField, MapperFactory } from "../dist/index";

class User extends MapperFactory {

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
        src: 'rolesToMap',
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

//TEST constructor
let u = new User({ firstName: "Rick", lastName: "Sanchez", employees: [emp1, emp2], rolesToMap: ["CEO", "EMPLOYEE"] });
console.log(u);

//TEST objToModel method with JS Object
let u1 = new User();
console.log(u1.objToModel(u));

//TEST objToModel method with JSON Object
console.log(u.objToModel({ name: "Rick TEST-objToModel", roles: ["CEO", "EMPLOYEE"] }));

//TEST toMap method
console.log(u.toMap());

//TEST empty method
console.log(u.empty());

//TEST get AND set method
u.set("name", "Rick TEST-SET");
console.log(u.get("name"));
