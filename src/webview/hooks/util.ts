import { cloneDeep } from "lodash";

export function setKeyValue(key, value, objInput) {
    const obj = cloneDeep(objInput);
    if (Array.isArray(obj)) {
        obj.forEach(function(element) {
            setKeyValue(key, value, element);
        });
    } else if (typeof obj === 'object' && obj !== null) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (prop === key) {
                    obj[prop] = value;
                }
                if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                    setKeyValue(key, value, obj[prop]);
                }
            }
        }
    }
    return obj;
}