export namespace Utils {
    /** dts2md break */
    /**
     * Tells whether `a` and `b` are shallowly equal
     */
    export const compare = (a: unknown, b: unknown): boolean => {

        if (Object.is(a, b)) {
            return true;
        }

        if (
            !(
                (a && typeof a === 'object')
                && (b && typeof b === 'object')
            )
        ) {
            return false;
        }

        if (Array.isArray(a) && Array.isArray(b)) {
            return (
                a.length === b.length
                && a.every((v, i) => Object.is(b[i], v))
            );
        } else {
            const keysA = Object.keys(a);
            return (
                keysA.length === Object.keys(b).length
                && keysA.every(
                    key => Object.is((a as any)[key], (b as any)[key])
                )
            );
        }

    };
    /** dts2md break */
    /**
     * Tells whether `a` and `b` are deeply equal
     * (supports circular reference)
     */
    export const compareDeeply = (a: unknown, b: unknown, cache?: Map<object, object>): boolean => {

        if (Object.is(a, b)) {
            return true;
        }

        if (
            (!a || typeof a !== 'object')
            || (!b || typeof b !== 'object')
        ) {
            return false;
        }

        const _cache = cache || new Map();
        if (cache && cache.get(a!) === b) {
            return true;
        }

        if (Array.isArray(a) && Array.isArray(b)) {

            const result = (
                a.length === b.length
                && a.every((v, i) => compareDeeply(b[i], v), _cache)
            );

            if (result) {
                _cache.set(a, b);
                _cache.set(b, a);
            }

            return result;

        } else {

            const keysA = Object.keys(a!);
            const result = (
                keysA.length === Object.keys(b!).length
                && keysA.every(
                    key => compareDeeply((a as any)[key], (b as any)[key], _cache)
                )
            );

            if (result) {
                _cache.set(a, b);
                _cache.set(b, a);
            }

            return result;

        }

    };

}
