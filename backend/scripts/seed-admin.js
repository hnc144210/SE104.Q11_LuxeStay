require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedAdmin() {
  console.log('Đang tạo tài khoản admin\n');

  const email = 'admin@luxestay.com';
  const password = 'Admin@123456';
  const full_name = 'System Administrator';

  try {
    console.log('Đang kiểm tra admin cũ...');
    const { data: oldProfiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'admin');

    if (oldProfiles && oldProfiles.length > 0) {
      console.log(`Tìm thấy ${oldProfiles.length} admin cũ, đang xóa...`);
      for (const profile of oldProfiles) {
        await supabase.from('profiles').delete().eq('id', profile.id);
        try {
          await supabase.auth.admin.deleteUser(profile.id);
        } catch (err) {
        }
      }
      console.log('Đã xóa admin cũ\n');
    }

    console.log('Đang kiểm tra user với email admin...');
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existingUser = users.find(u => u.email === ADMIN_EMAIL);
    
    if (existingUser) {
      console.log('Tìm thấy user cũ, đang xóa...');
      await supabase.from('profiles').delete().eq('id', existingUser.id);
      await supabase.auth.admin.deleteUser(existingUser.id);
      console.log('Đã xóa user cũ\n');
    }

    console.log('Đang tạo user mới...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: full_name }
    });

    if (authError || !authData?.user) {
      throw new Error(`Lỗi tạo user: ${authError?.message}`);
    }

    const userId = authData.user.id;
    console.log('User ID:', userId);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: autoProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (autoProfile) {
      console.log('Profile đã tồn tại, đang cập nhật...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ full_name: full_name, role: 'admin' })
        .eq('id', userId);

      if (updateError) throw new Error(`Lỗi update: ${updateError.message}`);
      console.log('Đã cập nhật thành admin!');
    } else {
      console.log('Profile chưa có, đang tạo mới...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, full_name: full_name, role: 'admin' });

      if (insertError) throw new Error(`Lỗi insert: ${insertError.message}`);
      console.log('Đã tạo profile admin!');
    }

    console.log('Đã tạo tài khoản admin!');
    console.log('Email:   ', email);
    console.log('Password:', password);
    console.log('Role:    ', 'admin');
    console.log('User ID: ', userId);

  } catch (error) {
    console.error('\n LỖI:', error.message);
    process.exit(1);
  }
}

seedAdmin().then(() => process.exit(0)).catch(err => {
  console.error( err);
  process.exit(1);
});