﻿declare module System.Linq {
    enum EnumerableAction {
        Break = 0,
        Return = 1,
        Skip = 2,
    }
    class Enumerable<T> extends DisposableBase implements Collections.IEnumerable<T> {
        private enumeratorFactory;
        constructor(enumeratorFactory: () => Collections.IEnumerator<T>, finalizer?: () => void);
        static fromArray<T>(array: T[]): ArrayEnumerable<T>;
        public getEnumerator(): Collections.IEnumerator<T>;
        public _onDispose(): void;
        static choice<T>(values: T[]): Enumerable<T>;
        static cycle<T>(values: T[]): Enumerable<T>;
        static empty<T>(): Enumerable<T>;
        static repeat<T>(element: T, count?: number): Enumerable<T>;
        static repeatWithFinalize<T>(initializer: () => T, finalizer: (element: T) => void): Enumerable<T>;
        static make<T>(element: T): Enumerable<T>;
        static range(start: number, count: number, step?: number): Enumerable<number>;
        static rangeDown(start: number, count: number, step?: number): Enumerable<number>;
        static toInfinity(start?: number, step?: number): Enumerable<number>;
        static toNegativeInfinity(start?: number, step?: number): Enumerable<number>;
        static rangeTo(start: number, to: number, step?: number): Enumerable<number>;
        static matches(input: string, pattern: any, flags?: string): Enumerable<RegExpExecArray>;
        static generate<T>(factory: (index?: number) => T, count?: number): Enumerable<T>;
        static unfold<T>(seed: T, valueFactory: Selector<T, T>): Enumerable<T>;
        static defer<T>(enumerableFactory: () => Collections.IEnumerable<T>): Enumerable<T>;
        static forEach<T>(enumerable: Collections.IEnumerable<T>, action: (element: T, index?: number) => any): void;
        public assertIsNotDisposed(errorMessage?: string): boolean;
        public forEach(action: Predicate<T>): void;
        public forEach(action: Action<T>): void;
        public toArray(predicate?: Predicate<T>): T[];
        public asEnumerable(): Enumerable<T>;
        public toLookup<TKey, TValue, TCompare>(keySelector: Selector<T, TKey>, elementSelector: Selector<T, TValue>, compareSelector?: Selector<TKey, TCompare>): Lookup<TKey, TValue>;
        public toMap<TResult>(keySelector: Selector<T, string>, elementSelector: Selector<T, TResult>): Collections.IMap<TResult>;
        public toDictionary<TKey, TValue, TCompare>(keySelector: Selector<T, TKey>, elementSelector: Selector<T, TValue>, compareSelector?: Selector<TKey, TCompare>): Collections.Dictionary<TKey, TValue>;
        public doAction(action: Selector<T, EnumerableAction>): Enumerable<T>;
        public doAction(action: Selector<T, number>): Enumerable<T>;
        public doAction(action: Predicate<T>): Enumerable<T>;
        public doAction(action: Action<T>): Enumerable<T>;
        public force(): void;
        public skip(count: number): Enumerable<T>;
        public skipWhile(predicate: Predicate<T>): Enumerable<T>;
        public take(count: number): Enumerable<T>;
        public select<TResult>(selector: (value: T, index?: number) => TResult): Enumerable<TResult>;
        public selectMany<TResult>(collectionSelector: Selector<T, Collections.IEnumerable<TResult>>): Enumerable<TResult>;
        public selectMany<TResult>(collectionSelector: Selector<T, TResult[]>): Enumerable<TResult>;
        public selectMany<TElement, TResult>(collectionSelector: Selector<T, Collections.IEnumerable<TElement>>, resultSelector?: (collection: T, element: TElement) => TResult): Enumerable<TResult>;
        public selectMany<TElement, TResult>(collectionSelector: Selector<T, TElement[]>, resultSelector?: (collection: T, element: TElement) => TResult): Enumerable<TResult>;
        public choose<TResult>(selector: Selector<T, TResult>): Enumerable<TResult>;
        public where(predicate: Predicate<T>): Enumerable<T>;
        public ofType<TType>(type: new() => TType): Enumerable<TType>;
        public except<TCompare>(second: Collections.IEnumerable<T>, compareSelector?: Selector<T, TCompare>): Enumerable<T>;
        public distinct(compareSelector?: (value: T) => T): Enumerable<T>;
        public distinctUntilChanged<TCompare>(compareSelector?: Selector<T, TCompare>): Enumerable<T>;
        public reverse(): Enumerable<T>;
        public shuffle(): Enumerable<T>;
        public count(predicate?: Predicate<T>): number;
        public all(predicate: Predicate<T>): boolean;
        public any(predicate?: Predicate<T>): boolean;
        public isEmpty(): boolean;
        public contains<TCompare>(value: T, compareSelector?: Selector<T, TCompare>): boolean;
        public defaultIfEmpty(defaultValue?: T): Enumerable<T>;
        public elementAt(index: number): T;
        public elementAtOrDefault(index: number, defaultValue?: T): T;
        public first(predicate?: Predicate<T>): T;
        public firstOrDefault(predicate: Predicate<T>, defaultValue?: T): T;
        public last(predicate?: Predicate<T>): T;
        public lastOrDefault(predicate: Predicate<T>, defaultValue?: T): T;
        public single(predicate?: Predicate<T>): T;
        public singleOrDefault(predicate: Predicate<T>, defaultValue?: T): T;
        public share(): Enumerable<T>;
        public memoize(): Enumerable<T>;
        public catchError(handler: (e: Error) => void): Enumerable<T>;
        public finallyAction(action: () => void): Enumerable<T>;
    }
    class ArrayEnumerable<T> extends Enumerable<T> {
        private _source;
        constructor(source: T[]);
        public _onDispose(): void;
        public source : T[];
        public toArray(): T[];
        public asEnumerable(): ArrayEnumerable<T>;
        public forEach(action: (element: T, index?: number) => boolean): void;
        public forEach(action: (element: T, index?: number) => void): void;
        public any(predicate?: Predicate<T>): boolean;
        public count(predicate?: Predicate<T>): number;
        public elementAt(index: number): T;
        public elementAtOrDefault(index: number, defaultValue?: T): T;
        public first(predicate?: Predicate<T>): T;
        public firstOrDefault(predicate: Predicate<T>, defaultValue?: T): T;
        public last(predicate?: Predicate<T>): T;
        public lastOrDefault(predicate: Predicate<T>, defaultValue?: T): T;
        public skip(count: number): Enumerable<T>;
        public takeExceptLast(count?: number): Enumerable<T>;
        public takeFromLast(count: number): Enumerable<T>;
        public reverse(): Enumerable<T>;
        public memoize(): ArrayEnumerable<T>;
    }
    class WhereEnumerable<T> extends Enumerable<T> {
        private prevSource;
        private prevPredicate;
        constructor(prevSource: Collections.IEnumerable<T>, prevPredicate: Predicate<T>);
        public where(predicate: Predicate<T>): Enumerable<T>;
        public select<TResult>(selector: (value: T, index?: number) => TResult): Enumerable<TResult>;
        public getEnumerator(): Collections.IEnumerator<T>;
        public _onDispose(): void;
    }
    class WhereSelectEnumerable<T, TSelect> extends Enumerable<TSelect> {
        private prevSource;
        private prevPredicate;
        private prevSelector;
        constructor(prevSource: Collections.IEnumerable<T>, prevPredicate: Predicate<T>, prevSelector: (value: T, index?: number) => TSelect);
        public where(predicate: (value: TSelect, index?: number) => boolean): Enumerable<TSelect>;
        public select<TResult>(selector: (value: TSelect, index?: number) => TResult): Enumerable<TResult>;
        public getEnumerator(): Collections.IEnumerator<TSelect>;
        public _onDispose(): void;
    }
    class OrderedEnumerable<T> extends Enumerable<T> {
        private source;
        public keySelector: (value: T) => any;
        public descending: boolean;
        public parent: OrderedEnumerable<T>;
        constructor(source: Collections.IEnumerable<T>, keySelector: (value: T) => any, descending: boolean, parent: OrderedEnumerable<T>);
        public createOrderedEnumerable(keySelector: (value: T) => any, descending: boolean): OrderedEnumerable<T>;
        public thenBy(keySelector: (value: T) => any): OrderedEnumerable<T>;
        public thenByDescending(keySelector: (value: T) => any): OrderedEnumerable<T>;
        public getEnumerator(): Collections.EnumeratorBase<T>;
        public _onDispose(): void;
    }
    interface ILookup<TKey, TElement> extends Collections.IEnumerable<IGrouping<TKey, TElement>> {
        count: number;
        get(key: TKey): TElement[];
        contains(key: TKey): boolean;
    }
    class Lookup<TKey, TElement> implements ILookup<TKey, TElement> {
        private _dictionary;
        constructor(_dictionary: Collections.Dictionary<TKey, TElement[]>);
        public count : number;
        public get(key: TKey): TElement[];
        public contains(key: TKey): boolean;
        public getEnumerator(): Collections.IEnumerator<Grouping<TKey, TElement>>;
    }
    interface IGrouping<TKey, TElement> extends Collections.IEnumerable<TElement> {
        key: TKey;
    }
    class Grouping<TKey, TElement> extends ArrayEnumerable<TElement> implements IGrouping<TKey, TElement> {
        private _groupKey;
        constructor(_groupKey: TKey, elements: TElement[]);
        public key : TKey;
    }
}