/**
 * Returns a cancelable version of the passed promise.
 *
 * @param {Promise} promise
 * @returns {{promise: Promise<any>, cancel(): void}}
 * @see https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
 */
export default (promise) => {
    let hasCanceled = false;

    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(
            (val) => hasCanceled ? reject({ isCanceled: true }) : resolve(val),
            (error) => hasCanceled ? reject({ isCanceled: true }) : reject(error),
        );
    });

    return {
        promise: wrappedPromise,
        cancel() {
            hasCanceled = true;
        },
    };
};
