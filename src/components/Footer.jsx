import React from 'react'

const Footer = () => {
    return (
        <div className='bg-slate-800 text-white flex flex-col justify-center items-center w-full px-4 py-6 text-center gap-2'>
            <div className="logo font-bold text-white text-xl sm:text-2xl">
                <span className='text-green-500'> &lt;</span>

                <span>Pass</span><span className='text-green-500'>OP/&gt;</span>


            </div>
            <div className='flex justify-center items-center flex-wrap gap-2 text-sm sm:text-base'>
                Created with <img className='w-5 sm:w-7' src="../icons/heart.png" alt="" /> by MohammadZaidHassan
            </div>
        </div>
    )
}

export default Footer
