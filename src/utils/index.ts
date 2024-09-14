interface ObjectLike<T = any> {
  [k: string]: T;
}

export const nullishValueTransform = ({ value }) => value ?? '';

export const mapObjectProperties = <
  ObjectType extends ObjectLike,
  ReturnType extends ObjectLike = ObjectLike,
>(
  object: ObjectType,
  mapping: { [Property in keyof ObjectType]: keyof ReturnType },
  ignoreEmptyValues?: boolean,
): ReturnType => {
  const mappedObject = {};

  for (const key in object) {
    if (!object[key] && ignoreEmptyValues) continue;

    if (mapping[key]) (mappedObject as any)[mapping[key]] = object[key];
  }

  return mappedObject as ReturnType;
};
