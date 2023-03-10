import { MapField, MapperFactory } from "../dist/index";

class History extends MapperFactory {
    id: string;

    @MapField({
        transformer: (arr) => " TEST TRASFORMER",
        reverser: (arr) => " TEST REVERSER",
    })
    name: string;
}

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

    @MapField({
        transformer: (user) => new User(user)
    })
    boss: User;

    @MapField({
        transformer: histories => histories.map(hst => new History(hst)),
        reverser: histories => histories.map(hst => hst.toMap()),
    })
    histories: History[];

}

let emp1: User = new User({ firstName: "Summer", lastName: "Smith" });
let emp2: User = new User({ firstName: "Morty", lastName: "Smith" });
let JSONObject = { firstName: "Rick", lastName: "Sanchez", employees: [emp1.toMap(), emp2.toMap()], rolesToMap: ["CEO", "EMPLOYEE"], boss: { firstName: "Nello", lastName: "Stanco" } };

//TEST constructor
let u = new User(JSONObject);
console.log("\nTEST constructor");
console.log(JSONObject);
console.log(u);

//TEST objToModel method with JS Object
let u1 = new User();
console.log("\nTEST objToModel method with JS Object");
console.log(u1.objToModel(u));

//TEST objToModel method with JSON Object
console.log("\nTEST objToModel method with JSON Object");
console.log(u.objToModel({ name: "Rick TEST-objToModel", roles: ["CEO TEST-objToModel", "EMPLOYEE TEST-objToModel"] }));

//TEST toMap method
console.log("\nTEST toMap method");
console.log(u.toMap());

//TEST empty method
console.log("\nTEST empty method");
console.log(u.empty());

//TEST get AND set method
u.set("employees[1].name", "name editato");
console.log("\nTEST get AND set method");
console.log(u);
console.log(u.get("employees[1].name"));

//TEST deep copy
console.log("\nTEST deep copy");
let dpCopy = new User(u.toMap());
dpCopy.name = "nome dpCopy";
console.log(u);
console.log(dpCopy);

//TEST trasformer/reverser
console.log("\nTEST reverser");
let h1 = new History({ name: "h1" });
let h2 = new History({ name: "h2" });
u.histories = [h1, h2];
console.log(u);
console.log(u.toMap());
