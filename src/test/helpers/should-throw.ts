export async function shouldThrow(f: Promise<any>): Promise<boolean> {
    try {
        await f;
        return false;
    } catch (e) {
        return true;
    }
}