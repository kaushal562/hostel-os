import React from "react";
import { Button } from "../ui/button";
import { LogOut, Menu, User, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import UserAvatar from "../ui/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface HeaderProps {
  studentName?: string;
  profilePicture?: string | null;
  onLogout?: () => void;
  onUpdateProfile?: () => void;
}

const Header = ({
  studentName = "Student",
  profilePicture = null,
  onLogout = () => console.log("Logout clicked"),
  onUpdateProfile = () => console.log("Update profile clicked"),
}: HeaderProps) => {
  return (
    <header className="w-full h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center">
        <div className="mr-2 md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-primary">Hostel Management</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="text-sm font-medium hidden md:block">
                {studentName}
              </span>
              <UserAvatar
                name={studentName}
                imageUrl={profilePicture}
                className="h-9 w-9"
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onUpdateProfile}>
              <User className="h-4 w-4 mr-2" />
              Update Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-500">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
