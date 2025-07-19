import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../config/firebase";

const uploadFile = async (file) => {
    const storageRef = ref(storage, file.name);
    //luu file nay len firebase
    const response = await uploadBytes(storageRef, file);
    //lay duong dan den file vua tao
    const downloadURL = await getDownloadURL(response.ref);
    return downloadURL;
};

export default uploadFile;