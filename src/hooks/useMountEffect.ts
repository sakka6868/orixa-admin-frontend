import {useEffect, useRef} from 'react';

const useMountEffect = (fun: any) => {
    const mountedRef = useRef(false);

    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true;
            return fun();
        }
    }, []);
};

export default useMountEffect;