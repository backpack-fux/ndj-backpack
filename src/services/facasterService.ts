import {Wallet} from 'ethers';
import {MerkleAPIClient, User} from '@standard-crypto/farcaster-js';

export class Farcaster {
  private constructor(private api: MerkleAPIClient, public user: User | null) {}

  public static async init(key: string) {
    const wallet = new Wallet(key);

    const api = new MerkleAPIClient(wallet);
    let currentUser: User | null = null;

    try {
      currentUser = await api.fetchCurrentUser();
    } catch (err) {}

    return new Farcaster(api, currentUser);
  }

  public async getFollowers() {
    let result: User[] = [];

    if (!this.user) {
      return result;
    }

    const res = this.api.fetchUserFollowers(this.user);

    for (let i = 0; i < this.user.followerCount; i += 1) {
      const userResponse = await res.next();

      if (userResponse.value) {
        result.push(userResponse.value);
      }
    }

    return result;
  }

  public getAddressForUser(user: User) {
    return this.api.fetchCustodyAddressForUser(user);
  }
}
