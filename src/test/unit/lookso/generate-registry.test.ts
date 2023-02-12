import { expect } from 'chai';

import { SocialRegistry } from '../../../lib/lookso/registry/types/social-registry';
import { RegistryChangeTable } from '../../../models/types/tables/registry-change-table';
import { generateNewRegistry } from '../../../lib/lookso/registry/utils/generate-new-registry';

export const GenerateRegistryTest = () => {
  const initialRegistry: SocialRegistry = {
    posts: [],
    likes: [],
    follows: [],
  };

  const basicRegistry: SocialRegistry = {
    posts: [],
    likes: ['post'],
    follows: ['bob'],
  };

  describe('Generate new registry from changes', () => {
    it('should handle correctly duplicates add changes', () => {
      const changes: RegistryChangeTable[] = [
        { address: '', type: 'follow', action: 'add', value: 'bob', date: new Date() },
        { address: '', type: 'follow', action: 'add', value: 'bob', date: new Date() },
        { address: '', type: 'like', action: 'add', value: 'post', date: new Date() },
        { address: '', type: 'like', action: 'add', value: 'post', date: new Date() },
      ];

      const newRegistry = generateNewRegistry(initialRegistry, changes);
      expect(newRegistry.follows.length).to.equal(1);
      expect(newRegistry.follows[0]).to.equal('bob');
      expect(newRegistry.likes.length).to.equal(1);
      expect(newRegistry.likes[0]).to.equal('post');
    });

    it('should handle correctly duplicates remove changes', () => {
      const changes: RegistryChangeTable[] = [
        { address: '', type: 'follow', action: 'remove', value: 'bob', date: new Date() },
        { address: '', type: 'follow', action: 'remove', value: 'bob', date: new Date() },
        { address: '', type: 'like', action: 'remove', value: 'post', date: new Date() },
        { address: '', type: 'like', action: 'remove', value: 'post', date: new Date() },
      ];

      const newRegistry = generateNewRegistry(basicRegistry, changes);
      expect(newRegistry.follows.length).to.equal(0);
      expect(newRegistry.likes.length).to.equal(0);
    });

    it('should handle correctly adding and removing an item', () => {
      const changes: RegistryChangeTable[] = [
        { address: '', type: 'follow', action: 'add', value: 'bob', date: new Date() },
        { address: '', type: 'follow', action: 'remove', value: 'bob', date: new Date() },
        { address: '', type: 'like', action: 'add', value: 'post', date: new Date() },
        { address: '', type: 'like', action: 'remove', value: 'post', date: new Date() },
      ];

      const newRegistry = generateNewRegistry(initialRegistry, changes);
      expect(newRegistry.follows.length).to.equal(0);
      expect(newRegistry.likes.length).to.equal(0);
    });

    it('should handle correctly adding and removing an item with duplicates', () => {
      const changes: RegistryChangeTable[] = [
        { address: '', type: 'follow', action: 'add', value: 'bob', date: new Date() },
        { address: '', type: 'follow', action: 'add', value: 'bob', date: new Date() },
        { address: '', type: 'follow', action: 'remove', value: 'bob', date: new Date() },
        { address: '', type: 'follow', action: 'add', value: 'bob', date: new Date() },
        { address: '', type: 'follow', action: 'remove', value: 'bob', date: new Date() },
        { address: '', type: 'like', action: 'add', value: 'post', date: new Date() },
        { address: '', type: 'like', action: 'remove', value: 'post', date: new Date() },
        { address: '', type: 'like', action: 'remove', value: 'post', date: new Date() },
        { address: '', type: 'like', action: 'add', value: 'post', date: new Date() },
        { address: '', type: 'like', action: 'remove', value: 'post', date: new Date() },
        { address: '', type: 'like', action: 'add', value: 'post', date: new Date() },
      ];

      const newRegistry = generateNewRegistry(initialRegistry, changes);
      expect(newRegistry.follows.length).to.equal(0);
      expect(newRegistry.likes.length).to.equal(1);
      expect(newRegistry.likes[0]).to.equal('post');
    });

    it('should return handle correctly when adding an already existing item', () => {
      const changes: RegistryChangeTable[] = [
        { address: '', type: 'follow', action: 'add', value: 'bob', date: new Date() },
        { address: '', type: 'like', action: 'add', value: 'post', date: new Date() },
      ];

      const newRegistry = generateNewRegistry(basicRegistry, changes);
      expect(newRegistry.follows.length).to.equal(1);
      expect(newRegistry.follows[0]).to.equal('bob');
      expect(newRegistry.likes.length).to.equal(1);
      expect(newRegistry.likes[0]).to.equal('post');
    });
  });
};
