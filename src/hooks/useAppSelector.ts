
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import type { TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch } from '../store/store';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
