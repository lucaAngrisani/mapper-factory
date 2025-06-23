import { MapClass, MapInterface } from "./class.decorator";
import { ArrayField } from "./field-decorators/array.decorator";
import { DateField } from "./field-decorators/date.decorator";
import { MapField } from "./field-decorators/field.decorator";
import { ObjectField } from "./field-decorators/object.decorator";

//MAPPER FACTORY - TEST
console.log("\nMAPPER FACTORY - TEST");
console.log("\n");

@MapClass()
class History {
  id: string;

  @MapField({
    transformer: (arr) => " TEST TRASFORMER",
    reverser: (arr) => " TEST REVERSER",
  })
  name: string;

  @MapField({
    src: "control",
  })
  testControl: string;

  @MapField({
    initialize: true,
    transformer: (arr, obj) => {
      return [obj.monday, obj.tuesday];
    },
    reverser: (arr) => {
      return { monday: arr && arr[0], tuesday: arr && arr[1] };
    },
  })
  daysActive: string[];

  @MapField({
    src: "test.concatenation",
  })
  testConcatenation: string;
}
interface History extends MapInterface<History> {}

@MapClass()
class User {
  id: string;
  username: string;

  @MapField({
    src: "firstName",
  })
  name: string;

  @MapField({
    src: "lastName",
  })
  surname: string;

  @MapField({
    src: "rolesToMap",
    transformer: (arr) => arr?.map((role) => role + " TEST TRASFORMER"),
    reverser: (arr) => arr?.map((role) => role.replace(" TEST TRASFORMER", "")),
  })
  roles?: string[];

  @MapField({
    transformer: (arr) => arr?.map((user) => new User().from(user)),
  })
  employees?: User[];

  @MapField({
    transformer: (user) => new User().from(user),
  })
  boss: User;

  @MapField({
    transformer: (histories) =>
      histories?.map((hst) => new History().from(hst)),
    reverser: (histories) => histories?.map((hst) => hst.toMap()),
  })
  histories: History[];
}
interface User extends MapInterface<User> {}

const emp1: User = new User().from({ firstName: "Summer", lastName: "Smith" });
const emp2: User = new User().from({ firstName: "Morty", lastName: "Smith" });
const JSONObject = {
  username: "god",
  firstName: "Rick",
  lastName: "Sanchez",
  employees: [emp1.toMap(), emp2.toMap()],
  rolesToMap: ["CEO", "EMPLOYEE"],
  boss: { firstName: "Nello", lastName: "Stanco" },
};

//TEST constructor
const u = new User().from(JSONObject);
const constructorTest: boolean =
  u.username == JSONObject.username &&
  u.name == JSONObject.firstName &&
  u.surname == JSONObject.lastName &&
  u.employees?.map((emp) => emp.name == emp1.name) &&
  u.roles?.map((role) => role == "CEO") &&
  u.boss.name == "Nello" &&
  u.boss.surname == "Stanco";
console.log("TEST CONSTRUCTOR", constructorTest ? "✅" : "❌");

//TEST toModel method with JS Object
const u1 = new User().toModel(u);
const toModelTest =
  u1.name == JSONObject.firstName &&
  u1.surname == JSONObject.lastName &&
  u1.employees?.map((emp) => emp.name == emp1.name) &&
  u1.roles?.map((role) => role == "CEO") &&
  u1.boss.name == "Nello" &&
  u1.boss.surname == "Stanco";
console.log("TEST TO MODEL USER", toModelTest ? "✅" : "❌");

//TEST [GET, SET] METHODS
u.set("employees[1].name", "name editato");
const toModelTest1 = u.get("employees[1].name") == "name editato";
console.log("TEST [GET, SET] METHODS", toModelTest1 ? "✅" : "❌");

//TEST TRANSFORMER/REVERSER
const h1 = new History().from({ name: "h1" });
const h2 = new History().from({ name: "h2" });
u.histories = [h1, h2];
const uMapped = u.toMap();
const toModelTest2 =
  uMapped.histories?.map((h) => h.name == " TEST REVERSER") &&
  u.histories?.map((h) => h.name == " TEST TRASFORMER");
console.log("TEST TRANSFORMER/REVERSER", toModelTest2 ? "✅" : "❌");

//TEST REF
const hTest = new History().from({
  monday: "0",
  tuesday: "1",
  control: "control",
});
hTest.daysActive = ["1", "0"];
const toModelTest3 =
  hTest.toMap().daysActive.monday == "1" &&
  hTest.toMap().daysActive.tuesday == "0";
console.log("TEST REF", toModelTest3 ? "✅" : "❌");

//TEST CONCAT WITH POINT
const hTest2 = new History().from({
  test: { concatenation: "resolve " },
  control: "control",
});
const toModelTest4 = hTest2.toMap().test.concatenation == "resolve ";
console.log("TEST CONCAT WITH POINT", toModelTest4 ? "✅" : "❌");

@MapClass()
class Test {
  @MapField({
    src: "b",
    transformer: (value) => "test transformer",
    reverser: (value) => ({ a: "test reverser" }),
  })
  a: string;
}
interface Test extends MapInterface<Test> {}

const testEmpty = new Test().from();
const testFilled = new Test().from({ b: "filled" });
const checkTest1 =
  testEmpty && testEmpty.empty() == true && testEmpty.filled() == false;
const checkTest2 =
  testFilled && testFilled.empty() == false && testFilled.filled() == true;
console.log(
  "TEST EMPTY/FILLED WITH INITIALIZE",
  checkTest1 && checkTest2 ? "✅" : "❌"
);

const model3 = new Test().toModel({ a: "test to model" });
console.log(
  "TEST TO MODEL WITH INITIALIZE",
  model3.a == "test to model" ? "✅" : "❌"
);

const model4 = model3.toMap();
console.log(
  "TEST TO MAP WITH INITIALIZE",
  model4.b.a == "test reverser" ? "✅" : "❌"
);

const model5 = model3.copy();
console.log(
  "TEST COPY WITH INITIALIZE",
  Object.keys(model5).every((k) => model5[k] == model3[k]) ? "✅" : "❌"
);

@MapClass()
class TestFlag {
  @MapField({
    transformer: (num) => num == "1",
    reverser: (bool) => (bool ? "1" : "0"),
    initialize: true,
  })
  flTest: boolean;
  @MapField({
    src: "b",
    transformer: (value) => "test transformer",
    reverser: (value) => ({ a: "test reverser" }),
    initialize: true,
  })
  a: string;
}
interface TestFlag extends MapInterface<TestFlag> {}

const testFlagInitialize = new TestFlag().from();
console.log(
  "TEST INITIALIZE",
  testFlagInitialize && testFlagInitialize.a == "test transformer" ? "✅" : "❌"
);

const testFlag0 = new TestFlag().from();
const testFlag0Map = testFlag0.toMap();
console.log(
  "TEST FLAG0",
  testFlag0.flTest === false && testFlag0Map.flTest == "0" ? "✅" : "❌"
);

const testFlag1 = new TestFlag().from({ flTest: "1" });
const testFlag1Map = testFlag1.toMap();
console.log(
  "TEST FLAG1",
  testFlag1.flTest && testFlag1Map.flTest == "1" ? "✅" : "❌"
);

const testFlag2 = new TestFlag().from({ flTest: "0" });
const testFlag2Map = testFlag2.toMap();
console.log(
  "TEST FLAG2",
  !testFlag2.flTest && testFlag2Map.flTest == "0" ? "✅" : "❌"
);

@MapClass()
class TestWithoutMapField {
  id?: string;
  name!: string;
}
interface TestWithoutMapField extends MapInterface<TestWithoutMapField> {}
const JSONObject2 = {
  id: "1",
  name: "Supplier 1",
};
const testWOMF = new TestWithoutMapField().from(JSONObject2);

console.log("TEST WITHOUT MAP FIELD", testWOMF ? "✅" : "❌");

@MapClass()
class ObjDecorator {
  id: string;
  @ObjectField(ObjDecorator)
  testObject?: ObjDecorator;
}
interface ObjDecorator extends MapInterface<ObjDecorator> {}

@MapClass()
class TestDecorators {
  @DateField()
  date?: Date;

  @ArrayField(ObjDecorator)
  objList!: ObjDecorator[];

  @ObjectField(ObjDecorator)
  obj!: ObjDecorator;
}
interface TestDecorators extends MapInterface<TestDecorators> {}

const JSONTestDecorators = {
  date: "2023-10-01T00:00:00Z",
  objList: [
    { id: "1", testObject: { id: "2" } },
    { id: "3", testObject: { id: "4" } },
  ],
  obj: { id: "5", testObject: { id: "6" } },
};
const testDecorators = new TestDecorators().from(JSONTestDecorators);
console.log("TEST WITH DECORATORS", (
    testDecorators.date.toISOString() &&
    testDecorators.objList?.length === 2 &&  
    testDecorators.obj instanceof ObjDecorator &&
    testDecorators.objList[0] instanceof ObjDecorator &&
    testDecorators.objList[0].testObject instanceof ObjDecorator
) ? "✅" : "❌");

console.log("\n");
