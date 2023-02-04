import { Link } from '../../../../models/types/metadata-objects';

export interface GetProfileResponse {
  address: string;
  name: string;
  links: Link[];
  tags: string[];
  description: string;
  profileImage: string;
  backgroundImage: string;
}
