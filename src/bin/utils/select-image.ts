import {Image} from '../../models/types/image';
import {MetadataImage} from '../../models/types/metadata-objects';

export function selectImage(images: Image[] | (MetadataImage | MetadataImage[])[], config: {minWidthExpected: number}) {
	const sortedImages = images.flat().sort((i1, i2) => {
		if (i1.width > i2.width) return -1;
		else return 1;
	});

	let pickedImage: Image | MetadataImage = sortedImages[0];

	for (let i = 0 ; i < sortedImages.length ; i++) {
		if (sortedImages[i + 1] && sortedImages[i + 1].width >= config.minWidthExpected) {
			pickedImage = sortedImages[i + 1];
		} else {
			break;
		}
	}

	return pickedImage ;
}