class CreateUsersAndUserInfos < ActiveRecord::Migration[7.0]
  def change
    create_table :users, id: :uuid do |t|
      t.string  :user_name,         null: false, limit: 50,  index: { unique: true }
      t.string  :email,             null: false, limit: 255, index: { unique: true }
      t.string  :password,                          limit: 50
      t.boolean :is_admin,          null: false, default: false
      t.boolean :is_verified,       null: false, default: false
      t.string  :verification_code,               limit: 6
      t.timestamps
    end

    create_table :user_infos, id: :uuid do |t|
      t.uuid    :user_id,          null: false, index: { unique: true }
      t.string  :first_name,        null: false, limit: 50
      t.string  :last_name,                    limit: 50
      t.text    :bio
      t.string  :profile_picture,              limit: 255
      t.date    :dob
      t.string  :country,                   limit: 50
      t.timestamps
    end

    add_foreign_key :user_infos, :users, column: :user_id, primary_key: :id
  end
end

# app/models/user.rb
class User < ApplicationRecord
  has_one :user_info, dependent: :destroy
end

# app/models/user_info.rb
class UserInfo < ApplicationRecord
  belongs_to :user
end
