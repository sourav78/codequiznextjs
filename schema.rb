ActiveRecord::Schema[8.0].define(version: 2025_05_12_120000) do
  # These extensions must be enabled
  enable_extension "plpgsql"

  create_table "users", id: :uuid, force: :cascade do |t|
    t.string   "user_name",       null: false, limit: 50
    t.string   "email",           null: false, limit: 255
    t.string   "password",                      limit: 50
    t.boolean  "is_admin",        null: false, default: false
    t.boolean  "is_verified",     null: false, default: false
    t.string   "verification_code",             limit: 6
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  create_table "user_infos", id: :uuid, force: :cascade do |t|
    t.uuid     "user_id",         null: false
    t.string   "first_name",      null: false, limit: 50
    t.string   "last_name",                   limit: 50
    t.text     "bio"
    t.string   "profile_picture",            limit: 255
    t.date     "dob"
    t.string   "country",                     limit: 50
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  add_foreign_key "user_infos", "users"
end
