---
layout: post
title:  "Cancelling API Requests using Axios"
date: 2021-01-17
tags: javascript axios
---

Recently I came across an issue with some VueJS code that I am maintaining for a work project.  There was a situation where choosing some data would trigger an API call that particular Vue component was created or updated, and the results would be used to populate a dropdown menu.  However if the user changes data too quickly, there may be a race condition where the first API call finishes after the second one, thus loading the wrong information into the dropdown menu.

Given that I am still a greenhorn when it comes to web development, I was unsure how to resolve this.  Originally I was thinking I could make the API call synchronous, but not only did this not resolve the issue, it potentially could have slowed down the user experience.  After some searching on how to resolve race conditions in API, I learned/realized that you actually can cancel the previous API request call.  After some tinkering, I was able to rewrite the Vue component to create a cancel token for a given API request, and use it to cancel that same request if the data field is updated (which again, triggers an API call).  Then I could safely execute another API request based on the updated data, and not worry that the race condition would occur.

For this example, I am using Axios, which is a Promise-based HTTP client based in node.js.  This code will also not reflect the solution I implemented for my actual work.

First things first... we need to create a cancel token, which is a matter of instantianting a new object.  I actually add this inside of the Vue component, and pass the `cancel_source` constant to the Vuex store method that is responsible for executing the Axios API call.  For this example I am just passing to a function rather than a Vuex method.  In addition, I add this `cancel_source` constant to the object returned by the `data()` function for the Vue component as well, so I can pass it around to other methods in that component

```javascript
// Create cancel token to cancel last request of this to prevent race condition
const CancelToken = axios.CancelToken;
const cancel_source = CancelToken.source();
const payload = "test payload";
run_api_call({ payload, cancel_source });
```

In the `run_api_call` function, the API POST request is executed using axios.post.  The cancellation token is passed in the request configuration object (the 3rd argument).  The Axios POST request also can catch if `CancelToken.cancel()` was called and handle it appropriately.  It is worth noting that you can use the same cancellation token for multiple API calls, but if `CancelToken.cancel()` is invoked it will cancel all API calls that have the token in its request configuration argument.  This is why for our case, we want to initialize a new CancelToken for each potential new API request.

```javascript
async run_api_call(payload, cancel_source) {
    await axios.post(
        "/api/fetch_good_data.py",
        payload,
        {
            cancelToken: cancel_source.token
        })
    .then(function (response) {console.log(response.data);})
    .catch(function (thrown) {
        if (axios.isCancel(thrown)) {
            console.log('Request canceled:', thrown.message);
        } else {
            // handle error
            console.log('some other error:', thrown.message);
        }
    });
}
```

When I am ready to run the `run_api_call` function again, I want to cancel the previous API call just in case it has not finished yet.  In my actual code, I wrote the following block to execute when the data we watch has been updated.  This code block is largely the same as the first code block, but first it invokes the `CancelToken.cancel()` method, which cancels the original Axios API call.  We have the option of writing a message, which gets printed to `console.log`.  We then create a new cancel token for the next call.

```javascript
// Cancelling last axios call, if applicable
cancel_source.cancel('Newer API call detected.');

// Create new cancel token so the previous cancel does not cancel the current call
const CancelToken = axios.CancelToken;
const cancel_source = CancelToken.source();
const payload = "test payload";
run_api_call({ payload, cancel_source });
```

I'm slowly getting more comfortable with the ins and outs of Javascript and all the various packages and flavors.  I feel writing this article is a good way for me to work towards the "learn JS" and "write more" New Years Resolution goals.

More info about this feature can be found at <https://github.com/axios/axios#cancellation>
