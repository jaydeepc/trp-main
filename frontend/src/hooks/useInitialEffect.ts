import { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useInitialEffect = (effect: () => void, deps: any[] = []) => {
    const isInitialMount = useRef(true);
    const prevDeps = useRef(deps);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            effect();
        } else if (deps.some((dep, index) => dep !== prevDeps.current[index])) {
            effect();
        }
        prevDeps.current = deps;
    }, deps);
};

export default useInitialEffect;
