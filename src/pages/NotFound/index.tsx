import { useAppSelector } from 'state';
import notFoundImg from '../../assets/images/NotFound.svg';
import { Theme } from 'state/user/reducer';
import { Link } from 'react-router-dom';

export default function NotFound() {
    const { theme } = useAppSelector((state) => state.user);
    return (
        <section className="flex flex-row items-center justify-center w-screen h-screen p-10">
            <div className="">
                <img src={notFoundImg} alt="404" height="350px" width="350px" />
            </div>
            <div>
                <p className='my-4'>
                    <h1>404</h1>
                    <h2>UH OH! You're lost.</h2>
                    <p>
                        The page you are looking for does not exist.
                        How you got here is a mystery. But you can click the button below
                        to go back.
                    </p>
                </p>
                <button
                    className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm text-center"
                        + (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
                >
                    <Link className=" flex flex-row  items-center justify-center px-5 py-2.5" to="/" target="_blank" >
                        HOME
                    </Link>
                </button>
            </div>
        </section>
    );
}