using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data;
using System.Data.SqlClient;
using TygaSoft.Model;

namespace TygaSoft.IDAL
{
    public partial interface IDics
    {
        #region IDics Member

        bool IsExistCode(string code, Guid Id);

        bool IsExistChild(Guid Id);

        #endregion
    }
}
