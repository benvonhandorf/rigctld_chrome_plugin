
export const evaluateObjects = (subset: any, superset: any) => {
  for (const property in subset) {
    if (Object.prototype.hasOwnProperty.call(subset, property)) {
      if (subset[property] !== superset[property]) {
        return false
      }
    }
  }

  return true
}

export const evaluateObjectsForProperties = (a: any, b: any, properties: string[]) => {
  for (const property of properties) {
    if (a[property] !== b[property]) {
      return false
    }
  }

  return true
}

export const spotsSameIncludingFrequency = (a: any, b: any) => {
  const properties = ['program', 'callsign', 'unit', 'location', 'frequency']

  return evaluateObjectsForProperties(a, b, properties)
}

export const spotsSameUnitAndCallsign = (a: any, b: any) => {
  const properties = ['callsign', 'unit']

  return evaluateObjectsForProperties(a, b, properties)
}
