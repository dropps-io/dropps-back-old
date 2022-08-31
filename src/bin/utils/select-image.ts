import {Image} from "../../models/types/image";

export function selectImage(images: Image[], config: {minWidthExpected: number}) {
  const sortedImages = images.sort((i1, i2) => {
    if (i1.width > i2.width) return -1;
    else return 1;
  });

  let pickedImage: Image = sortedImages[0];

  for (let i = 0 ; i < sortedImages.length ; i++) {
    if (sortedImages[i + 1] && sortedImages[i + 1].width >= config.minWidthExpected) {
      pickedImage = sortedImages[i + 1];
    } else {
      break;
    }
  }

  return pickedImage
}