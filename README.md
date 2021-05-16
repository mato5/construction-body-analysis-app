# Application for Construction Body Analysis

Note: This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Prerequisites

- [Git](https://git-scm.com/)
- [Node](https://nodejs.org/en/): an installation of the latest security patch of Node 12. The Node installation also includes the **npm** package manager.
- [TypeScript](https://www.typescriptlang.org/): this is listed as a devDependency, so if you're building it from source, you will get it.
- [Visual Studio Code](https://code.visualstudio.com/): an optional dependency, but the repository structure is optimized for its use

> See [supported platforms](https://github.com/imodeljs/imodeljs/blob/master/docs/learning/SupportedPlatforms.md) for further information.

## Environment Variables

You can change which Project and iModel the app connects to, add a valid contextId and iModelId for your user in the .env file:

```
# ---- Test ids ----
REACT_APP_TEST_CONTEXT_ID = ""
REACT_APP_TEST_IMODEL_ID = ""
```

You can also replace the OIDC client data in this file with your own if you'd prefer.

## Available Scripts

In the project directory, you can run:

### `npm install`

This will install all the necessary dependencies.\

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
