# Admin User Panel

This project is an admin user panel built with React, utilizing React Router for navigation, Redux Toolkit (RTK) for state management, and RTK Query for API interactions. It includes authentication middleware and layouts for both dashboard and authentication pages.

## Features

- **Authentication**: User login and logout functionality with state management using Redux Toolkit.
- **Dashboard**: Admin panel with a structured layout for managing user data and other administrative tasks.
- **Dynamic Forms**: Dynamically generated forms for entities like users, with validation and field configuration.
- **Routing**: Defined routes for authentication and dashboard pages using React Router.
- **State Management**: Utilizes Redux Toolkit for managing application state and RTK Query for API calls.
- **Persistence**: Authentication state is persisted using `redux-persist`.

## Project Structure

```
admin-user-panel
├── public
│   └── index.html
├── src
│   ├── components
│   │   ├── form
│   │   │   ├── entity
│   │   │   │   ├── EntityForm.tsx
│   │   │   │   ├── EntityIndex.tsx
│   │   │   │   └── fields
│   │   │   │       ├── TextInputField.tsx
│   │   │   │       ├── SelectInputField.tsx
│   │   │   │       ├── SwitchInputField.tsx
│   │   │   │       └── CheckboxInputField.tsx
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   ├── features
│   │   ├── auth
│   │   │   ├── authSlice.ts
│   │   │   ├── authMiddleware.ts
│   │   │   └── authApi.ts
│   │   └── api
│   │       ├── api.ts
│   │       └── entityApi.ts
│   ├── pages
│   │   ├── AuthPage.tsx
│   │   └── DashboardPage.tsx
│   ├── routes
│   │   ├── AppRoutes.tsx
│   │   └── EntityRoutes.tsx
│   ├── store
│   │   └── store.ts
│   ├── utils
│   │   └── EntityForm.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── styles
│       └── global.css
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd admin-user-panel
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Technologies Used

- **React**: Frontend library for building user interfaces.
- **Redux Toolkit**: State management library for managing global state.
- **RTK Query**: Data fetching and caching library integrated with Redux Toolkit.
- **React Router**: Library for handling routing in React applications.
- **TypeScript**: Superset of JavaScript for type safety and better developer experience.

## Features in Detail

### **Authentication**
- Login and logout functionality.
- Tokens are stored in `localStorage` and managed using `authSlice`.
- Includes token refresh functionality via `authApi`.

### **Dynamic Forms**
- Forms are dynamically generated based on the `entityFormFields` configuration in `EntityForm.ts`.
- Supports various field types like text, select, switch, and checkbox.
- Validation is handled using `yup` and `react-hook-form`.

### **Dashboard**
- Admin panel layout for managing entities like users.
- Includes dynamic table rendering with pagination and actions (view, edit, delete).

### **State Management**
- Global state is managed using Redux Toolkit.
- API interactions are handled using RTK Query.
- Authentication state is persisted using `redux-persist`.

## Contributing

Feel free to submit issues or pull requests to improve the project.

## License

This project is licensed under the MIT License.