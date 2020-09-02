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

}
