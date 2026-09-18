import React from 'react';
import { useGetUsersQuery } from 'features/accounts/api/userApi';

const UsersTestPage: React.FC = () => {
  const { data, isLoading, isError, error } = useGetUsersQuery();

  if (isLoading) {
    return <div>در حال دریافت کاربران...</div>;
  }

  if (isError) {
    console.error('Users API error:', error);

    return <div>خطا در دریافت کاربران</div>;
  }

  return (
    <div dir="rtl">
      <h1>کاربران</h1>

      {data?.results.length ? (
        <ul>
          {data.results.map((user) => (
            <li key={user.id}>
              {user.mobile}
            </li>
          ))}
        </ul>
      ) : (
        <p>کاربری وجود ندارد.</p>
      )}
    </div>
  );
};

export default UsersTestPage;