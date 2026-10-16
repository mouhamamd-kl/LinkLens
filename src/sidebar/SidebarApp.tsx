import React from 'react'
import typescriptLogo from '../images/icon.png'
import {watchPageTitle} from './page-title'

const NO_PAGE_TEXT = 'Open a web page to see its title here.'

export default function SidebarApp() {
  const [pageTitle, setPageTitle] = React.useState(NO_PAGE_TEXT)

  React.useEffect(() => {
    // watchPageTitle returns its own unsubscribe, and useEffect treats a
    // returned function as cleanup — so this needs nothing else.
    return watchPageTitle((answer) => {
      setPageTitle(answer ? answer.title : NO_PAGE_TEXT)
    })
  }, [])

  return (
    <div className="sidebar_app">
      <img className="sidebar_logo" src={typescriptLogo} alt="The TypeScript logo" />
      <h1 className="sidebar_title">Sidebar Panel</h1>
      <p className="sidebar_description">
        Learn more in the{' '}
        <a href="https://extension.js.org" target="_blank" rel="noopener noreferrer">
          Extension.js docs
        </a>{' '}
        .
      </p>
      <p className="sidebar_page_title">{pageTitle}</p>
    </div>
  )
}