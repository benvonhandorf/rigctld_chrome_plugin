import { v4 as uuidv4 } from 'uuid';

const generateRandomStringId = () => {
    return uuidv4();
}

export default generateRandomStringId;