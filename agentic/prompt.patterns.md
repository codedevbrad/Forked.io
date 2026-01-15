when possible for dealing with Objects that share the same role but differ in how they render and show, use a Registry Pattern for registering components/objects in a builder system.

register objects

/ blocks
  / blockA
     block.example.ts
     block.registry.ts
     block.types.ts
registry.ts

    
export const objectData = { 
    type: 'objecttypename',
    title: 'Creating ReactJs components',
    description: `Learn how to create a ReactJs component from scratch, step by step.`
}


export const ObjectRegistry1 = {
    type: "animatedCode",
    name: "Animated Code Block",
    icon: Book,
    render: Component,
    Editor: Component,
    defaultData: objectData
}

export const (name)Registry = {
    item1: ObjectRegistry1,
    item2: ObjectRegistry2,
};