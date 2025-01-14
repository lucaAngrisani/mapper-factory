# Mapper-Factory

Mapper-Factory is a fully documented TypeScript library that provides a simple and easy-to-use way to map objects from one type to another. With just a few lines of code, you can convert complex, nested objects into the desired format.

Work well on data structure and after enjoy the coding process :)

## Installation

To install the package, you can use npm by running the following command:

```
npm i mapper-factory
```

Or using yarn

```
yarn add mapper-factory
```

## Problem to solve

We want to solve the problem to trasform a JSON object to a specific JS object adding custom properties, with integrated mapping. As example this JSON object:

```
{
  firstName: 'Rick',
  lastName: 'Sanchez',
  employees: [
    { firstName: 'Summer', lastName: 'Smith' },
    { firstName: 'Morty', lastName: 'Smith' }
  ],
  rolesToMap: [ 'CEO', 'EMPLOYEE' ],
  boss: { firstName: 'Jesus', lastName: 'Christ' }
}
```

must became a JS object:

```
User {
  name: 'Rick',
  surname: 'Sanchez',
  employees: [
    User { name: 'Summer', surname: 'Smith' },
    User { name: 'Morty', surname: 'Smith' }
  ],
  roles: [ 'CEO TEST TRASFORMER', 'EMPLOYEE TEST TRASFORMER' ],
  boss: User { name: 'Jesus', surname: 'Christ' }
  /** maybe some methods... */
}
```

## Usage V2

### Mapping simple objects

Your class must use _MapClass_ decorator and set an interface that extends _MapInterface<T>_
In this way your class could extend another, but continue using intellisense methods for YourClass

```
@MapClass()
class YourClass extends YourCustomClassToExtend {
    /** YOUR PROPERTIES  */
}
interface YourClass extends MapInterface<YourClass> { }
```

To get new _YourClass_ instance it's simple as always:

```
new YourClass();
```

but now you can easly mapping an object just using _MapInterface_ method _from_:

```
const yourInstance: YourClass = new YourClass().from(/** YOUR OBJECT TO MAP HERE*/);
```

and reverse your mapping using using _MapInterface_ method _toMap_:

```
const reversedMapping: Object = yourInstance.toMap();
```

With _MapInterface_ you can use on your class instance also other methods:

- **_from_**: Create a new instance using model to map

```
const yourInstance: YourClass = new YourClass().from(/** YOUR OBJECT TO MAP HERE */);
```

- **_toMap_**: Create a JSON object using reverse mapping

```
const reverseMappedObject: Object = yourInstance.toMap();
```

- **_toModel_**: Create a new instance using same model of final JS object

```
const anotherInstance: YourClass = new YourClass.toModel(yourInstance);
```

- **_empty_**: Check if the object is empty

```
const isEmpty: boolean = yourInstance.empty();
```

- **_filled_**: Check if the object is filled

```
const isFilled: boolean = yourInstance.filled();
```

- **_get_**: Get specific property of the object

```
const specificProp: T = yourInstance.get('specificProp') as T;
```

- **_set_**: Set specific property of the object

```
yourInstance.set('specificProp', /** NEW VALUE FOR 'specificProp' */);
```

- **_copy_**: Deep copy of the object

```
const yourInstanceCopy: YourClass = yourInstance.copy();
```

After that, you can use _@MapField_ decorator over single property to specify the mapping. Let's dive into an example:

```
@MapClass()
class User {

    @MapField({
        src: 'firstName'
    })
    name: string;

    @MapField({
        src: 'obj.obj[0][1]',
        transformer: (arr) => arr.map(role => role + " TEST TRASFORMER"),
        reverser: (arr) => arr.map(role => role.replace(" TEST TRASFORMER", "")),
    })
    roles?: string[];

    @MapField({
        transformer: (user) => new User(user)
    })
    boss: User;
}
interface User extends MapInterface<User> { }
```

Inside _@MapField_ you can use:

- **_src_**: define a string of original field name (also using a path like _"obj.obj[0][1]"_)
- **_transform_**: function to transform data input in _constructor_ of the class
- **_reverse_**: function to transform data input in _toMap_ method of the class

In this example:

```
@MapClass()
class User {

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
    boss?: User;
}
interface User extends MapInterface<User> { }
```

You can define a new User **_u_**, using two employees (using the same User model here but for a different object is the same):

```
let emp1: User = new User().from({ firstName: "Summer", lastName: "Smith" });
let emp2: User = new User().from({ firstName: "Morty", lastName: "Smith" });

let u = new User().from({ firstName: "Rick", lastName: "Sanchez", employees: [emp1.toMap(), emp2.toMap()], rolesToMap: ["CEO", "EMPLOYEE"] });
```
