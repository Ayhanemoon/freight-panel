import React from 'react';
import { useGetUsersQuery } from 'features/accounts/api/userApi';
import { getApiError } from 'shared/api/apiError';

const UsersPage: React.FC = () => {
  const { data, isLoading, isError, error } = useGetUsersQuery({page: 2});

  if (isLoading) {
    return (
      <div dir="rtl">
        <h1>کاربران</h1>
        <p>در حال دریافت کاربران...</p>
      </div>
    );
  }

  if (isError) {
    const apiError = getApiError(error);

    console.error('Users API error:', apiError);

    return (
      <div dir="rtl">
        <h1>کاربران</h1>
        <p>{apiError.message}</p>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <h1>کاربران</h1>

      <p>تعداد کاربران: {data?.count ?? 0}</p>

      {data?.results.length ? (
        <table>
          <thead>
            <tr>
              <th>شناسه</th>
              <th>شماره موبایل</th>
              <th>ایمیل</th>
              <th>شعبه</th>
              <th>فعال</th>
              <th>تأیید موبایل</th>
            </tr>
          </thead>

          <tbody>
            {data.results.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.mobile}</td>
                <td>{user.email || '-'}</td>
                <td>{user.branch_name || '-'}</td>
                <td>{user.is_active ? 'بله' : 'خیر'}</td>
                <td>{user.is_mobile_verified ? 'بله' : 'خیر'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>کاربری وجود ندارد.</p>
      )}
    </div>
  );
};

export default UsersPage; 