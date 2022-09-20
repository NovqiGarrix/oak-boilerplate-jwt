import { Status } from '@deps';
import { OakContext } from '@types';

export const getBooks = (ctx: OakContext<"/">) => {

    /** Don't have to wrap the function with Try and Catch
     * unless your function return redirect.
     * 
     * ctx.response.redirect();
     */

    const { response: res } = ctx;

    const books = [
        { writer: "John Doe", title: "How to be a great Software Engineer" },
        { writer: "Smile Mith", title: "Keep Smiling!" },
    ]

    // Set HTTP Status Code
    res.status = Status.OK;

    // Return the body
    res.body = {
        data: books,
        error: null
    }

}