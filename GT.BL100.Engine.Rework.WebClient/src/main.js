// import App from './App.svelte';

// const urlSearchParams = new URLSearchParams(window.location.search);
// const params = Object.fromEntries(urlSearchParams.entries());


// const app = new App({
// 	target: document.body,
// 	props: {
// 		lineCode: params["line"]
// 	}
// });

// export default app;
import App from './App.svelte';

const app = new App({
  target: document.body
});

export default app;
