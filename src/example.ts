import { objToModel, toMap, toModel } from ".";
import { MapClass, MapInterface } from "../src/class.decorator";
import { MapField } from "../src/field.decorator";
import { MapperFactory } from "../src/mapper";

class History extends MapperFactory {
    id: string;

    @MapField({
        transformer: (arr) => " TEST TRASFORMER",
        reverser: (arr) => " TEST REVERSER",
    })
    name: string;

    @MapField({
        src: "control"
    })
    testControl: string;

    @MapField({
        initialize: true,
        transformer: (arr, obj) => { return [obj.monday, obj.tuesday] },
        reverser: (arr) => {
            return { monday: arr && arr[0], tuesday: arr && arr[1] }
        },
    })
    daysActive: string[];

    @MapField({
        src: "test.concatenation"
    })
    testConcatenation: string;
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
        transformer: (arr) => arr?.map(role => role + " TEST TRASFORMER"),
        reverser: (arr) => arr?.map(role => role.replace(" TEST TRASFORMER", "")),
    })
    roles?: string[];

    @MapField({
        transformer: (arr) => arr?.map(user => new User(user))
    })
    employees?: User[];

    @MapField({
        transformer: (user) => new User(user)
    })
    boss: User;

    @MapField({
        transformer: histories => histories?.map(hst => new History(hst)),
        reverser: histories => histories?.map(hst => hst.toMap()),
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
console.log("\n\n");

//TEST objToModel method with JS Object
let u1 = new User();
console.log("\nTEST objToModel method with JS Object");
console.log(u1.objToModel(u));
console.log("\n\n");

//TEST objToModel method with JSON Object
console.log("\nTEST objToModel method with JSON Object");
console.log(u.objToModel({ name: "Rick TEST-objToModel", roles: ["CEO TEST-objToModel", "EMPLOYEE TEST-objToModel"] }));
console.log("\n\n");

//TEST toMap method
console.log("\nTEST toMap method");
console.log(u.toMap());
console.log("\n\n");

//TEST empty method
console.log("\nTEST empty method");
console.log(u.empty());
console.log("\n\n");

//TEST get AND set method
u.set("employees[1].name", "name editato");
console.log("\nTEST get AND set method");
console.log(u);
console.log(u.get("employees[1].name"));
console.log("\n\n");

//TEST deep copy
console.log("\nTEST deep copy");
let dpCopy = new User(u.toMap());
dpCopy.name = "nome dpCopy";
console.log(u);
console.log(dpCopy);
console.log("\n\n");

//TEST trasformer/reverser
console.log("\nTEST reverser");
let h1 = new History({ name: "h1" });
let h2 = new History({ name: "h2" });
u.histories = [h1, h2];
console.log(u);
console.log(u.toMap());
console.log("\n\n");

//TEST ref
console.log("\nTEST REF");
let hTest = new History({ monday: "0", tuesday: "1", control: "control" });
console.log(hTest)
hTest.daysActive = ['1', '0'];
console.log(hTest.toMap());
console.log("\n\n");

//TEST concat with point
console.log("\nTEST CONCAT W POINT");
let hTest2 = new History({ test: { concatenation: "resolve " }, control: "control" });
console.log(hTest2)
console.log(hTest2.toMap());
console.log("\n\n");

//TEST FUNC MAPPER
console.log("\nTEST FUNC MAPPER");
console.log(emp1);
console.log(toMap(emp1));
const testEmp = toModel<User>(toMap(emp1));
console.log("USER MODEL: ", testEmp);
console.log(objToModel(emp1, { name: "test", surname: "prova" }));
console.log("\n\n");

//TEST NEW MapperFactory
console.log("\nTEST NEW MapperFactory");

@MapClass()
class Test {
    @MapField({
        src: 'b',
        transformer: value => 'test transformer',
        reverser: value => ({ a: 'test reverser' }),
        initialize: true,
    })
    a: string;
}
interface Test extends MapInterface<Test> { }

const test = new Test().from(/** INSIDE HERE YOUR OBJECT TO MAP */);
console.log("TEST 1: ", test);
console.log("EMPTY: ", test.empty());
console.log("FILLED: ", test.filled());

test.from({ b: 'filled' });
console.log("TEST 2: ", test);
console.log("EMPTY: ", test.empty());
console.log("FILLED: ", test.filled());
console.log("TO MODEL: ", test.toModel({ a: 'test to model' }));
console.log("TO MAP: ", test.toMap());
console.log("COPY: ", test.copy());
console.log("\n\n");

//TEST TestFlag with initialize
console.log("\nTEST TestFlag with initialize");

@MapClass()
class TestFlag {
    @MapField({
        transformer: (num) => num == '1',
        reverser: bool => bool ? '1' : '0',
        initialize: true,
    })
    flTest: string;
}
interface TestFlag extends MapInterface<TestFlag> { }

const testFlag0 = new TestFlag().from({ flTest: '0' });
console.log("TEST FLAG0", testFlag0);
console.log("TO MAP: ", testFlag0.toMap());

const testFlag1 = new TestFlag().from({ flTest: '1' });
console.log("TEST FLAG1", testFlag1);
console.log("TO MAP: ", testFlag1.toMap());

console.log("\n\n");