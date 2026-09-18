import React from 'react';
import { useGetUsersQuery } from 'features/accounts/api/userApi';

const UsersPage: React.FC = () => {
  const { data, isLoading, isError, error } = useGetUsersQuery();

  if (isLoading) {
    return (
      <div dir="rtl">
        <h1>کاربران</h1>
        <p>در حال دریافت کاربران...</p>
      </div>
    );
  }

  if (isError) {
    console.error('Users API error:', error);

    return (
      <div dir="rtl">
        <h1>کاربران</h1>
        <p>خطا در دریافت کاربران.</p>
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