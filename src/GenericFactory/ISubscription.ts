export interface ISubscription<TInterfaceType> {
    subscribe(i: TInterfaceType): void;
    unsubscribe(i: TInterfaceType): void;
}
